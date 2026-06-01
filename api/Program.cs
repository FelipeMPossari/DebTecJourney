using DebTecJourney.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("MobileApp", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("MobileApp");

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    application = "DebTec Journey API",
    timestamp = DateTimeOffset.UtcNow
}))
.WithName("HealthCheck")
.WithTags("System");

app.MapLearningEndpoints();

app.Run();
