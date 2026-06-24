using DebTecJourney.Api.Domain;

namespace DebTecJourney.Api.Contracts;

public sealed record RegisterRequest(
    string Name,
    string Email,
    string Password,
    string AcademicProfile,
    string ExperienceLevel,
    string LearningGoal,
    int DailyGoalMinutes);

public sealed record LoginRequest(string Email, string Password);

public sealed record AuthResponse(
    Guid Id,
    string Name,
    string Email,
    string AcademicProfile,
    string ExperienceLevel,
    string LearningGoal,
    int DailyGoalMinutes,
    int TotalXp,
    int CurrentLevel,
    string Token)
{
    public static AuthResponse From(ApplicationUser user, string token) =>
        new(
            user.Id,
            user.Name,
            user.Email,
            user.AcademicProfile,
            user.ExperienceLevel,
            user.LearningGoal,
            user.DailyGoalMinutes,
            user.TotalXp,
            user.CurrentLevel,
            token);
}

public sealed record UserProfileResponse(
    Guid Id,
    string Name,
    string Email,
    string AcademicProfile,
    string ExperienceLevel,
    string LearningGoal,
    int DailyGoalMinutes,
    int TotalXp,
    int CurrentLevel)
{
    public static UserProfileResponse From(ApplicationUser user) =>
        new(
            user.Id,
            user.Name,
            user.Email,
            user.AcademicProfile,
            user.ExperienceLevel,
            user.LearningGoal,
            user.DailyGoalMinutes,
            user.TotalXp,
            user.CurrentLevel);
}
