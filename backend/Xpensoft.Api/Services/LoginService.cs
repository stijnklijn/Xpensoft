using System.IdentityModel.Tokens.Jwt;
using System.Security.Authentication;
using System.Security.Claims;
using System.Text;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using Xpensoft.Api.Data;
using Xpensoft.Api.Dtos;
using Xpensoft.Api.Models;

namespace Xpensoft.Api.Services
{
    public class LoginService(XpensoftDbContext database, IConfiguration config, IPasswordHasher<User> passwordHasher)
    {

        private readonly XpensoftDbContext _database = database;
        private readonly IConfiguration _config = config;
        private readonly IPasswordHasher<User> _passwordHasher = passwordHasher;

        public async Task<string> Login(LoginRequestDto dto)
        {
            User? user = await _database.Users.AsNoTracking().FirstOrDefaultAsync(e => e.Email == dto.Email);
            if (user == null)
            {
                throw new InvalidCredentialException();
            }

            PasswordVerificationResult result = _passwordHasher.VerifyHashedPassword(user, user.Password, dto.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                throw new InvalidCredentialException();
            }

            return GenerateJwt(user);
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