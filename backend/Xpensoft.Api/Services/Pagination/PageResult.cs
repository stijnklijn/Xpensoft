namespace Xpensoft.Api.Services.Pagination;

public class PageResult<D>
{
    public int TotalResults { get; set; }
    public int TotalPages { get; set; }
    public int? PageNumber { get; set; }
    public int? PageSize { get; set; }

    public required IList<D> Data { get; set; }
}