using AutoMapper;

using Microsoft.EntityFrameworkCore;

using Sieve.Models;
using Sieve.Services;

namespace Xpensoft.Api.Services.Pagination;

public static class Paginator
{
    public static async Task<PageResult<D>> GetPageResult<E, D>(SieveModel sieveModel, SieveProcessor sieveProcessor, IQueryable<E> queryable, IMapper mapper)
    {
        IQueryable<E> filteredResult = sieveProcessor.Apply(sieveModel, queryable, applyPagination: false);
        int totalResults = await filteredResult.CountAsync();
        IQueryable<E> pagedResult = sieveProcessor.Apply(sieveModel, filteredResult, applyPagination: true);
        IList<E> entities = await pagedResult.ToListAsync();

        if (totalResults == 0)
        {
            return new PageResult<D>
            {
                TotalResults = 0,
                TotalPages = 0,
                PageNumber = 0,
                PageSize = 0,
                Data = []
            };
        }

        return new PageResult<D>
        {
            TotalResults = totalResults,
            TotalPages = (int)Math.Ceiling(totalResults / (decimal)(sieveModel.PageSize ?? totalResults)),
            PageNumber = sieveModel.Page ?? 1,
            PageSize = sieveModel.PageSize ?? totalResults,
            Data = mapper.Map<IList<D>>(entities)
        };
    }

}