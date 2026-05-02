namespace Xpensoft.Migration.TargetModels;

public class Category : BaseEntity
{
    public required Guid UserId { get; set; }

    public required User User { get; set; }

    public required string Name { get; set; }

    public required bool IsIncome { get; set; }

    public IList<Transaction> Transactions { get; set; } = new List<Transaction>();

}