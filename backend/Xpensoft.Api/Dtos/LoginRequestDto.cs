using System.ComponentModel.DataAnnotations;

namespace Xpensoft.Api.Dtos;

public class LoginRequestDto
{
    [Required]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }

}