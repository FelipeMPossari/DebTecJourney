namespace DebTecJourney.Api.Domain;

public sealed class Course
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsPublished { get; set; }
    public List<LearningModule> Modules { get; set; } = [];
}

public sealed class LearningModule
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public Course? Course { get; set; }
    public List<Lesson> Lessons { get; set; } = [];
}

public sealed class Lesson
{
    public Guid Id { get; set; }
    public Guid ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Order { get; set; }
    public int XpReward { get; set; }
    public LearningModule? Module { get; set; }
    public List<LessonPage> Pages { get; set; } = [];
    public List<Question> Questions { get; set; } = [];
}

public sealed class LessonPage
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Highlight { get; set; } = string.Empty;
    public int Order { get; set; }
    public Lesson? Lesson { get; set; }
}

public sealed class Question
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public string Statement { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public int Order { get; set; }
    public Lesson? Lesson { get; set; }
    public List<AnswerOption> AnswerOptions { get; set; } = [];
}

public sealed class AnswerOption
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public Question? Question { get; set; }
}
