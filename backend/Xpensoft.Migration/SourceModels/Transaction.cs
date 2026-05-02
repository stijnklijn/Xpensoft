using System.ComponentModel.DataAnnotations.Schema;

namespace Xpensoft.Migration.SourceModels;

public class Transaction : BaseEntity
{
    [Column("header_id")]
    public required int HeaderId { get; set; }

    public required Header Header { get; set; }

    public required DateOnly Date { get; set; }

    public required string Description { get; set; }

    public required decimal Amount { get; set; }
}