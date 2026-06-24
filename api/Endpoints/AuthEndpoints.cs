using DebTecJourney.Api.Contracts;
using DebTecJourney.Api.Data;
using DebTecJourney.Api.Domain;
using DebTecJourney.Api.Extensions;
using DebTecJourney.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DebTecJourney.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/register", async (
            RegisterRequest request,
            AppDbContext db,
            IPasswordHasher<ApplicationUser> passwordHasher,
            JwtTokenService jwtTokenService) =>
        {
            var normalizedEmail = NormalizeEmail(request.Email);
            var normalizedName = request.Name.Trim();

            if (string.IsNullOrWhiteSpace(normalizedName) || !IsValidEmail(normalizedEmail) || request.Password.Length < 4)
            {
                return Results.BadRequest(new { error = "Informe nome, e-mail válido e senha com pelo menos 4 caracteres." });
            }

            var emailAlreadyExists = await db.Users.AnyAsync(user => user.Email == normalizedEmail);

            if (emailAlreadyExists)
            {
                return Results.Conflict(new { error = "Já existe uma conta cadastrada com este e-mail." });
            }

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                Name = normalizedName,
                Email = normalizedEmail,
                AcademicProfile = NormalizeShortText(request.AcademicProfile, "Estudante de Ciência da Computação"),
                ExperienceLevel = NormalizeShortText(request.ExperienceLevel, "Iniciante"),
                LearningGoal = NormalizeShortText(request.LearningGoal, "Aprender conceitos de dívida técnica"),
                DailyGoalMinutes = Math.Clamp(request.DailyGoalMinutes, 5, 30),
                CreatedAt = DateTimeOffset.UtcNow
            };

            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
            db.Users.Add(user);
            await db.SaveChangesAsync();

            var token = jwtTokenService.CreateToken(user);
            return Results.Created("/api/auth/me", AuthResponse.From(user, token));
        });

        group.MapPost("/login", async (
            LoginRequest request,
            AppDbContext db,
            IPasswordHasher<ApplicationUser> passwordHasher,
            JwtTokenService jwtTokenService) =>
        {
            var normalizedEmail = NormalizeEmail(request.Email);
            var user = await db.Users.FirstOrDefaultAsync(item => item.Email == normalizedEmail);

            if (user is null)
            {
                return Results.Unauthorized();
            }

            var passwordResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (passwordResult == PasswordVerificationResult.Failed)
            {
                return Results.Unauthorized();
            }

            var token = jwtTokenService.CreateToken(user);
            return Results.Ok(AuthResponse.From(user, token));
        });

        group.MapGet("/me", async (HttpContext httpContext, AppDbContext db) =>
        {
            var userId = httpContext.User.GetRequiredUserId();
            var user = await db.Users.FirstOrDefaultAsync(item => item.Id == userId);

            return user is null
                ? Results.NotFound()
                : Results.Ok(UserProfileResponse.From(user));
        })
        .RequireAuthorization();

        return app;
    }

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();

    private static bool IsValidEmail(string email) =>
        email.Contains('@', StringComparison.Ordinal) && email.Length <= 180;

    private static string NormalizeShortText(string value, string fallback)
    {
        var normalizedValue = value.Trim();
        return string.IsNullOrWhiteSpace(normalizedValue) ? fallback : normalizedValue;
    }
}
