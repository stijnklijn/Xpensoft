namespace Xpensoft.Migration.TargetModels;

public class Transaction : BaseEntity
{
    public required Guid UserId { get; set; }

    public required User User { get; set; }

    public Guid? CategoryId { get; set; }

    public Category? Category { get; set; }

    public required DateOnly Date { get; set; }

    public required string Description { get; set; }

    public required decimal Amount { get; set; }
}