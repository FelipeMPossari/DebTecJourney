using DebTecJourney.Api.Contracts;
using DebTecJourney.Api.Data;

namespace DebTecJourney.Api.Endpoints;

public static class LearningEndpoints
{
    public static IEndpointRouteBuilder MapLearningEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api").WithTags("Learning");

        group.MapGet("/courses", () =>
            Results.Ok(SeedLearningContent.Courses
                .Where(course => course.IsPublished)
                .OrderBy(course => course.Order)
                .Select(CourseSummaryResponse.From)));

        group.MapGet("/courses/{courseId:guid}", (Guid courseId) =>
        {
            var course = SeedLearningContent.FindCourse(courseId);
            return course is null ? Results.NotFound() : Results.Ok(CourseResponse.From(course));
        });

        group.MapGet("/courses/{courseId:guid}/modules", (Guid courseId) =>
        {
            var course = SeedLearningContent.FindCourse(courseId);

            return course is null
                ? Results.NotFound()
                : Results.Ok(course.Modules.OrderBy(module => module.Order).Select(ModuleSummaryResponse.From));
        });

        group.MapGet("/modules/{moduleId:guid}/lessons", (Guid moduleId) =>
        {
            var module = SeedLearningContent.FindModule(moduleId);

            return module is null
                ? Results.NotFound()
                : Results.Ok(module.Lessons.OrderBy(lesson => lesson.Order).Select(LessonSummaryResponse.From));
        });

        group.MapGet("/lessons/{lessonId:guid}", (Guid lessonId) =>
        {
            var lesson = SeedLearningContent.FindLesson(lessonId);
            return lesson is null ? Results.NotFound() : Results.Ok(LessonResponse.From(lesson));
        });

        group.MapGet("/lessons/{lessonId:guid}/questions", (Guid lessonId) =>
        {
            var lesson = SeedLearningContent.FindLesson(lessonId);

            return lesson is null
                ? Results.NotFound()
                : Results.Ok(lesson.Questions.OrderBy(question => question.Order).Select(QuestionResponse.From));
        });

        group.MapPost("/questions/{questionId:guid}/answer", (Guid questionId, AnswerQuestionRequest request) =>
        {
            var question = SeedLearningContent.FindQuestion(questionId);
            if (question is null)
            {
                return Results.NotFound();
            }

            var selectedOption = question.AnswerOptions.FirstOrDefault(option => option.Id == request.AnswerOptionId);
            if (selectedOption is null)
            {
                return Results.BadRequest(new { error = "A alternativa informada não pertence a esta pergunta." });
            }

            return Results.Ok(new AnswerQuestionResponse(
                question.Id,
                selectedOption.Id,
                selectedOption.IsCorrect,
                selectedOption.Feedback,
                question.Explanation,
                selectedOption.IsCorrect ? 10 : 0));
        });

        return app;
    }
}
