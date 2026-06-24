namespace DebTecJourney.Api.Data;

public sealed record CourseContentFile(
    Guid Id,
    string Title,
    string Description,
    int Order,
    bool IsPublished,
    IReadOnlyList<ModuleContentFile> Modules);

public sealed record ModuleContentFile(
    Guid Id,
    string Title,
    string Description,
    int Order,
    IReadOnlyList<LessonContentFile> Lessons);

public sealed record LessonContentFile(
    Guid Id,
    string Title,
    string Summary,
    string Content,
    int Order,
    int XpReward,
    IReadOnlyList<LessonPageContentFile> Pages,
    IReadOnlyList<QuestionContentFile> Questions);

public sealed record LessonPageContentFile(
    Guid Id,
    string Title,
    string Body,
    string Highlight,
    int Order);

public sealed record QuestionContentFile(
    Guid Id,
    string Statement,
    string Explanation,
    int Order,
    IReadOnlyList<AnswerOptionContentFile> AnswerOptions);

public sealed record AnswerOptionContentFile(
    Guid Id,
    string Text,
    bool IsCorrect,
    string Feedback);
