using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DebTecJourney.Api.Domain;
using Microsoft.IdentityModel.Tokens;

namespace DebTecJourney.Api.Services;

public sealed class JwtTokenService(IConfiguration configuration)
{
    public string CreateToken(ApplicationUser user)
    {
        var signingCredentials = new SigningCredentials(CreateSigningKey(configuration), SecurityAlgorithms.HmacSha256);
        var issuer = configuration["Jwt:Issuer"] ?? "DebTecJourney.Api";
        var audience = configuration["Jwt:Audience"] ?? "DebTecJourney.Mobile";
        var expiresAt = DateTime.UtcNow.AddDays(14);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: expiresAt,
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static SymmetricSecurityKey CreateSigningKey(IConfiguration configuration)
    {
        var signingKey = configuration["Jwt:SigningKey"];

        if (string.IsNullOrWhiteSpace(signingKey))
        {
            throw new InvalidOperationException("Configure Jwt:SigningKey before starting the API.");
        }

        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
    }
}
