using DebTecJourney.Api.Contracts;
using DebTecJourney.Api.Data;
using DebTecJourney.Api.Domain;
using DebTecJourney.Api.Extensions;
using Microsoft.EntityFrameworkCore;

namespace DebTecJourney.Api.Endpoints;

public static class LearningEndpoints
{
    public static IEndpointRouteBuilder MapLearningEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api").WithTags("Learning");

        group.MapGet("/courses", async (AppDbContext db) =>
        {
            var courses = await db.Courses
                .Include(course => course.Modules)
                .Where(course => course.IsPublished)
                .OrderBy(course => course.Order)
                .ToListAsync();

            return Results.Ok(courses.Select(CourseSummaryResponse.From));
        });

        group.MapGet("/courses/{courseId:guid}", async (Guid courseId, AppDbContext db) =>
        {
            var course = await db.Courses
                .Include(item => item.Modules)
                    .ThenInclude(module => module.Lessons)
                .FirstOrDefaultAsync(item => item.Id == courseId);

            return course is null ? Results.NotFound() : Results.Ok(CourseResponse.From(course));
        });

        group.MapGet("/courses/{courseId:guid}/modules", async (Guid courseId, AppDbContext db) =>
        {
            var course = await db.Courses
                .Include(item => item.Modules)
                    .ThenInclude(module => module.Lessons)
                .FirstOrDefaultAsync(item => item.Id == courseId);

            return course is null
                ? Results.NotFound()
                : Results.Ok(course.Modules.OrderBy(module => module.Order).Select(ModuleSummaryResponse.From));
        });

        group.MapGet("/modules/{moduleId:guid}/lessons", async (Guid moduleId, AppDbContext db) =>
        {
            var module = await db.Modules
                .Include(item => item.Lessons)
                    .ThenInclude(lesson => lesson.Pages)
                .Include(item => item.Lessons)
                    .ThenInclude(lesson => lesson.Questions)
                .FirstOrDefaultAsync(item => item.Id == moduleId);

            return module is null
                ? Results.NotFound()
                : Results.Ok(module.Lessons.OrderBy(lesson => lesson.Order).Select(LessonSummaryResponse.From));
        });

        group.MapGet("/lessons/{lessonId:guid}", async (Guid lessonId, AppDbContext db) =>
        {
            var lesson = await db.Lessons
                .Include(item => item.Pages)
                .Include(item => item.Questions)
                    .ThenInclude(question => question.AnswerOptions)
                .FirstOrDefaultAsync(item => item.Id == lessonId);

            return lesson is null ? Results.NotFound() : Results.Ok(LessonResponse.From(lesson));
        });

        group.MapGet("/lessons/{lessonId:guid}/questions", async (Guid lessonId, AppDbContext db) =>
        {
            var lesson = await db.Lessons
                .Include(item => item.Questions)
                    .ThenInclude(question => question.AnswerOptions)
                .FirstOrDefaultAsync(item => item.Id == lessonId);

            return lesson is null
                ? Results.NotFound()
                : Results.Ok(lesson.Questions.OrderBy(question => question.Order).Select(QuestionResponse.From));
        });

        group.MapGet("/users/me/course-overview", async (HttpContext httpContext, AppDbContext db) =>
        {
            var userId = httpContext.User.GetRequiredUserId();
            var user = await db.Users.FirstOrDefaultAsync(item => item.Id == userId);

            if (user is null)
            {
                return Results.NotFound();
            }

            var course = await db.Courses
                .Include(item => item.Modules)
                    .ThenInclude(module => module.Lessons)
                .Where(item => item.IsPublished)
                .OrderBy(item => item.Order)
                .FirstOrDefaultAsync();

            if (course is null)
            {
                return Results.NotFound();
            }

            var completedLessonIds = await db.UserProgress
                .Where(progress => progress.UserId == userId && progress.Status == "completed")
                .Select(progress => progress.LessonId)
                .ToHashSetAsync();

            return Results.Ok(BuildCourseOverview(course, user, completedLessonIds));
        })
        .RequireAuthorization();

        group.MapPost("/questions/{questionId:guid}/answer", async (
            Guid questionId,
            AnswerQuestionRequest request,
            HttpContext httpContext,
            AppDbContext db) =>
        {
            var userId = httpContext.User.GetRequiredUserId();
            var user = await db.Users.FirstOrDefaultAsync(item => item.Id == userId);

            if (user is null)
            {
                return Results.NotFound();
            }

            var question = await db.Questions
                .Include(item => item.Lesson)
                .Include(item => item.AnswerOptions)
                .FirstOrDefaultAsync(item => item.Id == questionId);

            if (question is null)
            {
                return Results.NotFound();
            }

            var selectedOption = question.AnswerOptions.FirstOrDefault(option => option.Id == request.AnswerOptionId);

            if (selectedOption is null)
            {
                return Results.BadRequest(new { error = "A alternativa informada não pertence a esta pergunta." });
            }

            var xpEarned = 0;
            var existingProgress = await db.UserProgress.FirstOrDefaultAsync(progress =>
                progress.UserId == userId && progress.LessonId == question.LessonId);

            if (selectedOption.IsCorrect && existingProgress?.Status != "completed")
            {
                xpEarned = question.Lesson?.XpReward ?? 10;
                user.TotalXp += xpEarned;
                user.CurrentLevel = Math.Max(1, (user.TotalXp / 100) + 1);

                if (existingProgress is null)
                {
                    db.UserProgress.Add(new UserProgress
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        LessonId = question.LessonId,
                        Status = "completed",
                        Score = 100,
                        XpEarned = xpEarned,
                        CompletedAt = DateTimeOffset.UtcNow
                    });
                }
                else
                {
                    existingProgress.Status = "completed";
                    existingProgress.Score = 100;
                    existingProgress.XpEarned += xpEarned;
                    existingProgress.CompletedAt = DateTimeOffset.UtcNow;
                }
            }

            db.UserAnswers.Add(new UserAnswer
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                QuestionId = question.Id,
                AnswerOptionId = selectedOption.Id,
                IsCorrect = selectedOption.IsCorrect,
                AnsweredAt = DateTimeOffset.UtcNow
            });

            await db.SaveChangesAsync();

            return Results.Ok(new AnswerQuestionResponse(
                question.Id,
                selectedOption.Id,
                selectedOption.IsCorrect,
                selectedOption.Feedback,
                question.Explanation,
                xpEarned));
        })
        .RequireAuthorization();

        return app;
    }

    private static CourseOverviewResponse BuildCourseOverview(
        Course course,
        ApplicationUser user,
        HashSet<Guid> completedLessonIds)
    {
        var orderedModules = course.Modules.OrderBy(module => module.Order).ToList();
        var orderedLessons = orderedModules.SelectMany(module => module.Lessons.OrderBy(lesson => lesson.Order)).ToList();
        var firstIncompleteLessonId = orderedLessons.FirstOrDefault(lesson => !completedLessonIds.Contains(lesson.Id))?.Id;
        var completedCount = orderedLessons.Count(lesson => completedLessonIds.Contains(lesson.Id));
        var debtReducedPercent = orderedLessons.Count == 0
            ? 0
            : (int)Math.Round((double)completedCount / orderedLessons.Count * 100);

        var modules = orderedModules.Select(module =>
        {
            var moduleLessons = module.Lessons.OrderBy(lesson => lesson.Order).ToList();
            var moduleCompletedCount = moduleLessons.Count(lesson => completedLessonIds.Contains(lesson.Id));
            var progress = moduleLessons.Count == 0 ? 0 : (double)moduleCompletedCount / moduleLessons.Count;

            var lessons = moduleLessons.Select(lesson =>
            {
                var status = completedLessonIds.Contains(lesson.Id)
                    ? "completed"
                    : lesson.Id == firstIncompleteLessonId
                        ? "available"
                        : "locked";

                return new LessonOverviewResponse(lesson.Id, lesson.Title, lesson.XpReward, status);
            }).ToList();

            return new ModuleOverviewResponse(module.Id, module.Title, module.Description, progress, lessons);
        }).ToList();

        return new CourseOverviewResponse(
            course.Id,
            course.Title,
            course.Description,
            user.TotalXp,
            user.CurrentLevel,
            debtReducedPercent,
            modules);
    }
}
