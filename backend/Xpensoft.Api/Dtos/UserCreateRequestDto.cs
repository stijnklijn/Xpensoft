using System.ComponentModel.DataAnnotations;

namespace Xpensoft.Api.Dtos;

public class UserCreateRequestDto : BaseEntityDto
{
    [Required]
    [EmailAddress]
    [StringLength(255, ErrorMessage = "Email must not be more than 255 characters.")]
    public required string Email { get; set; }

    [Required]
    [RegularExpression("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$", ErrorMessage = "Password requires at least 8 characters, one uppercase character, one lowercase character, one digit, and one special character out of the following set: @#$%^&+=!")]
    [StringLength(255, ErrorMessage = "Password must not be more than 255 characters.")]
    public required string Password { get; set; }

    [Required]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "FirstName must be between 2 and 255 characters.")]
    public required string FirstName { get; set; }

    [Required]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "LastName must be between 2 and 255 characters.")]
    public required string LastName { get; set; }

}