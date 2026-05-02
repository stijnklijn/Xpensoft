using System.ComponentModel.DataAnnotations;

namespace Xpensoft.Api.Dtos;

public class UserUpdateRequestDto : BaseEntityDto
{
    [Required]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "FirstName must be between 2 and 255 characters.")]
    public required string FirstName { get; set; }

    [Required]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "LastName must be between 2 and 255 characters.")]
    public required string LastName { get; set; }

    [RegularExpression("de|en|fr|nl", ErrorMessage = "Unsupported language")]
    public string? Language { get; set; }

    [Range(10, 1_000, ErrorMessage = "DefaultResultsPerPage must be between 10 and 1000")]
    public int? DefaultResultsPerPage { get; set; }

}