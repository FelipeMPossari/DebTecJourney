namespace DebTecJourney.Api.Domain;

public sealed class ApplicationUser
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string AcademicProfile { get; set; } = string.Empty;
    public string ExperienceLevel { get; set; } = string.Empty;
    public string LearningGoal { get; set; } = string.Empty;
    public int DailyGoalMinutes { get; set; } = 10;
    public int TotalXp { get; set; }
    public int CurrentLevel { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public List<UserProgress> Progress { get; set; } = [];
    public List<UserAnswer> Answers { get; set; } = [];
}

public sealed class UserProgress
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public string Status { get; set; } = "available";
    public int Score { get; set; }
    public int XpEarned { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public ApplicationUser? User { get; set; }
    public Lesson? Lesson { get; set; }
}

public sealed class UserAnswer
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid AnswerOptionId { get; set; }
    public bool IsCorrect { get; set; }
    public DateTimeOffset AnsweredAt { get; set; } = DateTimeOffset.UtcNow;
    public ApplicationUser? User { get; set; }
    public Question? Question { get; set; }
    public AnswerOption? AnswerOption { get; set; }
}
