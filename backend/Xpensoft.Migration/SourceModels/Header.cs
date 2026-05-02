using System.ComponentModel.DataAnnotations.Schema;

namespace Xpensoft.Migration.SourceModels;

public class Header : BaseEntity
{
    [Column("user_id")]
    public required int UserId { get; set; }

    public required User User { get; set; }

    public required string Name { get; set; }

    public required bool Income { get; set; }

}