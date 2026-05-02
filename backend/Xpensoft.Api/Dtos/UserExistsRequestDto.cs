using System.ComponentModel.DataAnnotations;

namespace Xpensoft.Api.Dtos;

public class UserExistsRequestDto
{
    [Required]
    public required string Email { get; set; }

}