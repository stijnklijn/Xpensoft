using System.ComponentModel.DataAnnotations;

namespace Xpensoft.Api.Dtos;

public class CategoryDto : BaseEntityDto
{
    [Required]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 255 characters.")]
    public required string Name { get; set; }

    [Required]
    public required bool IsIncome { get; set; }

}