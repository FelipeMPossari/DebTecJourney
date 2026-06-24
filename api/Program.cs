using DebTecJourney.Api.Data;
using DebTecJourney.Api.Domain;
using DebTecJourney.Api.Endpoints;
using DebTecJourney.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var databasePath = Path.Combine(builder.Environment.ContentRootPath, "debtecjourney.db");
var configuredConnectionString = builder.Configuration.GetConnectionString("Default");
var connectionString = string.IsNullOrWhiteSpace(configuredConnectionString)
    ? $"Data Source={databasePath}"
    : ResolveSqliteConnectionString(configuredConnectionString, builder.Environment.ContentRootPath);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));
builder.Services.AddScoped<LearningContentSeeder>();
builder.Services.AddScoped<DatabaseSchemaUpdater>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<IPasswordHasher<ApplicationUser>, PasswordHasher<ApplicationUser>>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("MobileApp", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "DebTecJourney.Api",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "DebTecJourney.Mobile",
            IssuerSigningKey = JwtTokenService.CreateSigningKey(builder.Configuration),
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();

    var schemaUpdater = scope.ServiceProvider.GetRequiredService<DatabaseSchemaUpdater>();
    await schemaUpdater.ApplyAsync();

    var contentSeeder = scope.ServiceProvider.GetRequiredService<LearningContentSeeder>();
    await contentSeeder.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("MobileApp");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    application = "DebTec Journey API",
    timestamp = DateTimeOffset.UtcNow
}))
.WithName("HealthCheck")
.WithTags("System");

app.MapAuthEndpoints();
app.MapLearningEndpoints();

app.Run();

static string ResolveSqliteConnectionString(string connectionString, string contentRootPath)
{
    var builder = new SqliteConnectionStringBuilder(connectionString);

    if (!string.IsNullOrWhiteSpace(builder.DataSource) && !Path.IsPathRooted(builder.DataSource))
    {
        builder.DataSource = Path.Combine(contentRootPath, builder.DataSource);
    }

    return builder.ToString();
}
