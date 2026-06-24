using System.Text.Json;
using DebTecJourney.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace DebTecJourney.Api.Data;

public sealed class LearningContentSeeder(
    AppDbContext db,
    IWebHostEnvironment environment,
    ILogger<LearningContentSeeder> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var contentPath = ResolveContentPath();

        if (!File.Exists(contentPath))
        {
            logger.LogWarning("Learning content file not found at {ContentPath}", contentPath);
            return;
        }

        await using var stream = File.OpenRead(contentPath);
        var courseFile = await JsonSerializer.DeserializeAsync<CourseContentFile>(stream, JsonOptions, cancellationToken);

        if (courseFile is null)
        {
            logger.LogWarning("Learning content file at {ContentPath} is empty or invalid", contentPath);
            return;
        }

        var course = await db.Courses
            .Include(item => item.Modules)
                .ThenInclude(module => module.Lessons)
                .ThenInclude(lesson => lesson.Pages)
            .Include(item => item.Modules)
                .ThenInclude(module => module.Lessons)
                .ThenInclude(lesson => lesson.Questions)
                .ThenInclude(question => question.AnswerOptions)
            .FirstOrDefaultAsync(item => item.Id == courseFile.Id, cancellationToken);

        if (course is null)
        {
            db.Courses.Add(ToCourse(courseFile));
        }
        else
        {
            UpdateCourse(course, courseFile);
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private string ResolveContentPath()
    {
        var rootContentPath = Path.GetFullPath(Path.Combine(
            environment.ContentRootPath,
            "..",
            "content",
            "technical-debt-course.json"));

        if (File.Exists(rootContentPath))
        {
            return rootContentPath;
        }

        return Path.Combine(environment.ContentRootPath, "content", "technical-debt-course.json");
    }

    private void UpdateCourse(Course target, CourseContentFile source)
    {
        target.Title = source.Title;
        target.Description = source.Description;
        target.Order = source.Order;
        target.IsPublished = source.IsPublished;

        SyncModules(target.Modules, source.Modules, source.Id);
    }

    private void SyncModules(List<LearningModule> target, IReadOnlyList<ModuleContentFile> source, Guid courseId)
    {
        var sourceIds = source.Select(module => module.Id).ToHashSet();

        for (var index = target.Count - 1; index >= 0; index--)
        {
            if (!sourceIds.Contains(target[index].Id))
            {
                db.Modules.Remove(target[index]);
                target.RemoveAt(index);
            }
        }

        foreach (var sourceModule in source)
        {
            var targetModule = target.FirstOrDefault(module => module.Id == sourceModule.Id);

            if (targetModule is null)
            {
                target.Add(ToModule(sourceModule, courseId));
                continue;
            }

            targetModule.CourseId = courseId;
            targetModule.Title = sourceModule.Title;
            targetModule.Description = sourceModule.Description;
            targetModule.Order = sourceModule.Order;
            SyncLessons(targetModule.Lessons, sourceModule.Lessons, sourceModule.Id);
        }
    }

    private void SyncLessons(List<Lesson> target, IReadOnlyList<LessonContentFile> source, Guid moduleId)
    {
        var sourceIds = source.Select(lesson => lesson.Id).ToHashSet();

        for (var index = target.Count - 1; index >= 0; index--)
        {
            if (!sourceIds.Contains(target[index].Id))
            {
                db.Lessons.Remove(target[index]);
                target.RemoveAt(index);
            }
        }

        foreach (var sourceLesson in source)
        {
            var targetLesson = target.FirstOrDefault(lesson => lesson.Id == sourceLesson.Id);

            if (targetLesson is null)
            {
                target.Add(ToLesson(sourceLesson, moduleId));
                continue;
            }

            targetLesson.ModuleId = moduleId;
            targetLesson.Title = sourceLesson.Title;
            targetLesson.Summary = sourceLesson.Summary;
            targetLesson.Content = sourceLesson.Content;
            targetLesson.Order = sourceLesson.Order;
            targetLesson.XpReward = sourceLesson.XpReward;
            SyncPages(targetLesson.Pages, sourceLesson.Pages, sourceLesson.Id);
            SyncQuestions(targetLesson.Questions, sourceLesson.Questions, sourceLesson.Id);
        }
    }

    private void SyncPages(List<LessonPage> target, IReadOnlyList<LessonPageContentFile> source, Guid lessonId)
    {
        var sourceIds = source.Select(page => page.Id).ToHashSet();

        for (var index = target.Count - 1; index >= 0; index--)
        {
            if (!sourceIds.Contains(target[index].Id))
            {
                db.LessonPages.Remove(target[index]);
                target.RemoveAt(index);
            }
        }

        foreach (var sourcePage in source)
        {
            var targetPage = target.FirstOrDefault(page => page.Id == sourcePage.Id);

            if (targetPage is null)
            {
                target.Add(ToPage(sourcePage, lessonId));
                continue;
            }

            targetPage.LessonId = lessonId;
            targetPage.Title = sourcePage.Title;
            targetPage.Body = sourcePage.Body;
            targetPage.Highlight = sourcePage.Highlight;
            targetPage.Order = sourcePage.Order;
        }
    }

    private void SyncQuestions(List<Question> target, IReadOnlyList<QuestionContentFile> source, Guid lessonId)
    {
        var sourceIds = source.Select(question => question.Id).ToHashSet();

        for (var index = target.Count - 1; index >= 0; index--)
        {
            if (!sourceIds.Contains(target[index].Id))
            {
                db.Questions.Remove(target[index]);
                target.RemoveAt(index);
            }
        }

        foreach (var sourceQuestion in source)
        {
            var targetQuestion = target.FirstOrDefault(question => question.Id == sourceQuestion.Id);

            if (targetQuestion is null)
            {
                target.Add(ToQuestion(sourceQuestion, lessonId));
                continue;
            }

            targetQuestion.LessonId = lessonId;
            targetQuestion.Statement = sourceQuestion.Statement;
            targetQuestion.Explanation = sourceQuestion.Explanation;
            targetQuestion.Order = sourceQuestion.Order;
            SyncAnswerOptions(targetQuestion.AnswerOptions, sourceQuestion.AnswerOptions, sourceQuestion.Id);
        }
    }

    private void SyncAnswerOptions(List<AnswerOption> target, IReadOnlyList<AnswerOptionContentFile> source, Guid questionId)
    {
        var sourceIds = source.Select(option => option.Id).ToHashSet();

        for (var index = target.Count - 1; index >= 0; index--)
        {
            if (!sourceIds.Contains(target[index].Id))
            {
                db.AnswerOptions.Remove(target[index]);
                target.RemoveAt(index);
            }
        }

        foreach (var sourceOption in source)
        {
            var targetOption = target.FirstOrDefault(option => option.Id == sourceOption.Id);

            if (targetOption is null)
            {
                target.Add(ToAnswerOption(sourceOption, questionId));
                continue;
            }

            targetOption.QuestionId = questionId;
            targetOption.Text = sourceOption.Text;
            targetOption.IsCorrect = sourceOption.IsCorrect;
            targetOption.Feedback = sourceOption.Feedback;
        }
    }

    private static Course ToCourse(CourseContentFile source) =>
        new()
        {
            Id = source.Id,
            Title = source.Title,
            Description = source.Description,
            Order = source.Order,
            IsPublished = source.IsPublished,
            Modules = source.Modules.Select(module => ToModule(module, source.Id)).ToList()
        };

    private static LearningModule ToModule(ModuleContentFile source, Guid courseId) =>
        new()
        {
            Id = source.Id,
            CourseId = courseId,
            Title = source.Title,
            Description = source.Description,
            Order = source.Order,
            Lessons = source.Lessons.Select(lesson => ToLesson(lesson, source.Id)).ToList()
        };

    private static Lesson ToLesson(LessonContentFile source, Guid moduleId) =>
        new()
        {
            Id = source.Id,
            ModuleId = moduleId,
            Title = source.Title,
            Summary = source.Summary,
            Content = source.Content,
            Order = source.Order,
            XpReward = source.XpReward,
            Pages = source.Pages.Select(page => ToPage(page, source.Id)).ToList(),
            Questions = source.Questions.Select(question => ToQuestion(question, source.Id)).ToList()
        };

    private static LessonPage ToPage(LessonPageContentFile source, Guid lessonId) =>
        new()
        {
            Id = source.Id,
            LessonId = lessonId,
            Title = source.Title,
            Body = source.Body,
            Highlight = source.Highlight,
            Order = source.Order
        };

    private static Question ToQuestion(QuestionContentFile source, Guid lessonId) =>
        new()
        {
            Id = source.Id,
            LessonId = lessonId,
            Statement = source.Statement,
            Explanation = source.Explanation,
            Order = source.Order,
            AnswerOptions = source.AnswerOptions.Select(option => ToAnswerOption(option, source.Id)).ToList()
        };

    private static AnswerOption ToAnswerOption(AnswerOptionContentFile source, Guid questionId) =>
        new()
        {
            Id = source.Id,
            QuestionId = questionId,
            Text = source.Text,
            IsCorrect = source.IsCorrect,
            Feedback = source.Feedback
        };
}
