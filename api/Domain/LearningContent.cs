namespace DebTecJourney.Api.Domain;

public sealed record Course(
    Guid Id,
    string Title,
    string Description,
    int Order,
    bool IsPublished,
    IReadOnlyList<LearningModule> Modules);

public sealed record LearningModule(
    Guid Id,
    Guid CourseId,
    string Title,
    string Description,
    int Order,
    IReadOnlyList<Lesson> Lessons);

public sealed record Lesson(
    Guid Id,
    Guid ModuleId,
    string Title,
    string Summary,
    string Content,
    IReadOnlyList<LessonPage> Pages,
    int Order,
    int XpReward,
    IReadOnlyList<Question> Questions);

public sealed record LessonPage(
    Guid Id,
    Guid LessonId,
    string Title,
    string Body,
    string Highlight,
    int Order);

public sealed record Question(
    Guid Id,
    Guid LessonId,
    string Statement,
    string Explanation,
    int Order,
    IReadOnlyList<AnswerOption> AnswerOptions);

public sealed record AnswerOption(
    Guid Id,
    Guid QuestionId,
    string Text,
    bool IsCorrect,
    string Feedback);
