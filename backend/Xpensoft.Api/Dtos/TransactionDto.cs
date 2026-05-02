using System.ComponentModel.DataAnnotations;

namespace Xpensoft.Api.Dtos;

public class TransactionDto : BaseEntityDto
{
    public Guid? CategoryId { get; set; }

    [Required]
    public required DateOnly Date { get; set; }

    [Required]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "Description must be between 2 and 255 characters.")]
    public required string Description { get; set; }

    [Required]
    [Range(0.01, 999_999.99, ErrorMessage = "Amount must be between 0.01 and 999999.99")]
    public required decimal Amount { get; set; }

}