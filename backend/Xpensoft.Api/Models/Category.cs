using Sieve.Attributes;

namespace Xpensoft.Api.Models;

public class Category : BaseEntity
{
    public required Guid UserId { get; set; }

    public required User User { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public required string Name { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public required bool IsIncome { get; set; }

    public IList<Transaction> Transactions { get; set; } = new List<Transaction>();

}