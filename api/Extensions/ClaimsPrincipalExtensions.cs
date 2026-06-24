using System.Security.Claims;

namespace DebTecJourney.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetRequiredUserId(this ClaimsPrincipal user)
    {
        var rawUserId = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (Guid.TryParse(rawUserId, out var userId))
        {
            return userId;
        }

        throw new InvalidOperationException("Authenticated user id claim is missing or invalid.");
    }
}
