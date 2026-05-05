using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Authentication;
using System.Security.Claims;
using System.Text;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using Xpensoft.Api.Data;
using Xpensoft.Api.Dtos;
using Xpensoft.Api.Exceptions;
using Xpensoft.Api.Models;

namespace Xpensoft.Api.Services
{
    public class LoginService(XpensoftDbContext database, IConfiguration config, IPasswordHasher<User> passwordHasher)
    {
        private const int MAX_FAILED_AUTH_EVENTS = 5;

        private readonly XpensoftDbContext _database = database;
        private readonly IConfiguration _config = config;
        private readonly IPasswordHasher<User> _passwordHasher = passwordHasher;

        public async Task<string> Login(LoginRequestDto dto, IPAddress? ipAddress)
        {
            User? user = await _database.Users.FirstOrDefaultAsync(e => e.Email == dto.Email);
            if (user == null)
            {
                throw new InvalidCredentialException();
            }

            if (user.IsLocked)
            {
                throw new CustomUserIsLockedException("LOGIN__USER_IS_LOCKED");
            }

            PasswordVerificationResult result = _passwordHasher.VerifyHashedPassword(user, user.Password, dto.Password);
            bool isSuccessful = result != PasswordVerificationResult.Failed;

            AuthEvent authEvent = new(user.Id, ipAddress?.ToString(), isSuccessful);
            _database.AuthEvents.Add(authEvent);
            await _database.SaveChangesAsync();

            if (isSuccessful)
            {
                return GenerateJwt(user);
            }
            else
            {
                await DetermineUserLock(user);
                throw new InvalidCredentialException();
            }
        }

        private async Task DetermineUserLock(User user)
        {
            IList<AuthEvent> latestAuthEvents = await _database.AuthEvents.AsNoTracking()
            .Where(a => a.UserId == user.Id)
            .OrderByDescending(a => a.CreatedAt)
            .Take(MAX_FAILED_AUTH_EVENTS)
            .ToListAsync();

            user.IsLocked = latestAuthEvents.Count == MAX_FAILED_AUTH_EVENTS && latestAuthEvents.All(a => !a.IsSuccessful);
            await _database.SaveChangesAsync();
        }

        private string GenerateJwt(User user)
        {
            Claim[] claims = { new(ClaimTypes.NameIdentifier, user.Id.ToString()), new(ClaimTypes.Email, user.Email!) };

            SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

            SigningCredentials creds = new(key, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken token = new(
                issuer: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}