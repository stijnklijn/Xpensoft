using System.ComponentModel.DataAnnotations;

namespace Xpensoft.Api.Models;

public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    [Timestamp]
    public byte[]? RowVersion { get; set; } = default;

}