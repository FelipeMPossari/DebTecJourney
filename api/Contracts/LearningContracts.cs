using DebTecJourney.Api.Domain;

namespace DebTecJourney.Api.Contracts;

public sealed record CourseSummaryResponse(
    Guid Id,
    string Title,
    string Description,
    int Order,
    int ModuleCount)
{
    public static CourseSummaryResponse From(Course course) =>
        new(course.Id, course.Title, course.Description, course.Order, course.Modules.Count);
}

public sealed record CourseResponse(
    Guid Id,
    string Title,
    string Description,
    int Order,
    IReadOnlyList<ModuleSummaryResponse> Modules)
{
    public static CourseResponse From(Course course) =>
        new(course.Id, course.Title, course.Description, course.Order, course.Modules.Select(ModuleSummaryResponse.From).ToList());
}

public sealed record ModuleSummaryResponse(
    Guid Id,
    Guid CourseId,
    string Title,
    string Description,
    int Order,
    int LessonCount)
{
    public static ModuleSummaryResponse From(LearningModule module) =>
        new(module.Id, module.CourseId, module.Title, module.Description, module.Order, module.Lessons.Count);
}

public sealed record LessonSummaryResponse(
    Guid Id,
    Guid ModuleId,
    string Title,
    string Summary,
    int Order,
    int XpReward,
    int QuestionCount)
{
    public static LessonSummaryResponse From(Lesson lesson) =>
        new(lesson.Id, lesson.ModuleId, lesson.Title, lesson.Summary, lesson.Order, lesson.XpReward, lesson.Questions.Count);
}

public sealed record LessonResponse(
    Guid Id,
    Guid ModuleId,
    string Title,
    string Summary,
    string Content,
    int Order,
    int XpReward,
    IReadOnlyList<QuestionResponse> Questions)
{
    public static LessonResponse From(Lesson lesson) =>
        new(
            lesson.Id,
            lesson.ModuleId,
            lesson.Title,
            lesson.Summary,
            lesson.Content,
            lesson.Order,
            lesson.XpReward,
            lesson.Questions.Select(QuestionResponse.From).ToList());
}

public sealed record QuestionResponse(
    Guid Id,
    Guid LessonId,
    string Statement,
    string Explanation,
    int Order,
    IReadOnlyList<AnswerOptionResponse> AnswerOptions)
{
    public static QuestionResponse From(Question question) =>
        new(
            question.Id,
            question.LessonId,
            question.Statement,
            question.Explanation,
            question.Order,
            question.AnswerOptions.Select(AnswerOptionResponse.From).ToList());
}

public sealed record AnswerOptionResponse(Guid Id, string Text)
{
    public static AnswerOptionResponse From(AnswerOption option) =>
        new(option.Id, option.Text);
}

public sealed record AnswerQuestionRequest(Guid AnswerOptionId);

public sealed record AnswerQuestionResponse(
    Guid QuestionId,
    Guid AnswerOptionId,
    bool IsCorrect,
    string Feedback,
    string Explanation,
    int XpEarned);
