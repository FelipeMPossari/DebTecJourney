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
        new(
            course.Id,
            course.Title,
            course.Description,
            course.Order,
            course.Modules.OrderBy(module => module.Order).Select(ModuleSummaryResponse.From).ToList());
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
    int PageCount,
    int QuestionCount)
{
    public static LessonSummaryResponse From(Lesson lesson) =>
        new(lesson.Id, lesson.ModuleId, lesson.Title, lesson.Summary, lesson.Order, lesson.XpReward, lesson.Pages.Count, lesson.Questions.Count);
}

public sealed record LessonResponse(
    Guid Id,
    Guid ModuleId,
    string Title,
    string Summary,
    string Content,
    IReadOnlyList<LessonPageResponse> Pages,
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
            lesson.Pages.OrderBy(page => page.Order).Select(LessonPageResponse.From).ToList(),
            lesson.Order,
            lesson.XpReward,
            lesson.Questions.Select(QuestionResponse.From).ToList());
}

public sealed record LessonPageResponse(
    Guid Id,
    Guid LessonId,
    string Title,
    string Body,
    string Highlight,
    int Order)
{
    public static LessonPageResponse From(LessonPage page) =>
        new(page.Id, page.LessonId, page.Title, page.Body, page.Highlight, page.Order);
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
            question.AnswerOptions.OrderBy(option => option.Text).Select(AnswerOptionResponse.From).ToList());
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

public sealed record CourseOverviewResponse(
    Guid Id,
    string Title,
    string Description,
    int TotalXp,
    int CurrentLevel,
    int DebtReducedPercent,
    IReadOnlyList<ModuleOverviewResponse> Modules);

public sealed record ModuleOverviewResponse(
    Guid Id,
    string Title,
    string Description,
    double Progress,
    IReadOnlyList<LessonOverviewResponse> Lessons);

public sealed record LessonOverviewResponse(
    Guid Id,
    string Title,
    int XpReward,
    string Status);
