using AutoMapper;

using Microsoft.EntityFrameworkCore;

using Sieve.Models;
using Sieve.Services;

using Xpensoft.Api.Data;
using Xpensoft.Api.Dtos;
using Xpensoft.Api.Exceptions;
using Xpensoft.Api.Models;
using Xpensoft.Api.Services.Pagination;

namespace Xpensoft.Api.Services;

public class TransactionService(XpensoftDbContext database, SieveProcessor sieveProcessor, IMapper mapper)
{
    private readonly XpensoftDbContext _database = database;
    private readonly SieveProcessor _sieveProcessor = sieveProcessor;
    private readonly IMapper _mapper = mapper;

    public async Task<TransactionDto> Create(Guid userId, TransactionDto dto)
    {
        if (dto.CategoryId != null)
        {
            Category? category = await _database.Categories.AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == userId && e.Id == dto.CategoryId);
            if (category == null)
            {
                throw new CustomResourceNotFoundException("TRANSACTION__CATEGORY_NOT_FOUND");
            }
        }
        Transaction entity = _mapper.Map<Transaction>(dto);
        entity.UserId = userId;
        await _database.AddAsync(entity);
        await _database.SaveChangesAsync();
        return _mapper.Map<TransactionDto>(entity);
    }

    public async Task<PageResult<TransactionDto>> ReadAll(Guid userId, SieveModel sieveModel)
    {
        IQueryable<Transaction> queryable = _database.Transactions.AsNoTracking()
            .Where(e => e.UserId == userId);
        return await Paginator.GetPageResult<Transaction, TransactionDto>(sieveModel, _sieveProcessor, queryable, _mapper);
    }

    public async Task<TransactionDto> ReadById(Guid userId, Guid entityId)
    {
        Transaction? entity = await _database.Transactions.AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId && e.Id == entityId);
        if (entity == null)
        {
            throw new CustomResourceNotFoundException("TRANSACTION__NOT_FOUND");
        }
        return _mapper.Map<TransactionDto>(entity);
    }

    public async Task<TransactionDto> Update(Guid userId, Guid entityId, TransactionDto dto)
    {
        Transaction? entity = await _database.Transactions.
            FirstOrDefaultAsync(e => e.UserId == userId && e.Id == entityId);
        if (entity == null)
        {
            throw new CustomResourceNotFoundException("TRANSACTION__NOT_FOUND");
        }

        if (dto.CategoryId != null)
        {
            Category? category = await _database.Categories.AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == userId && e.Id == dto.CategoryId);
            if (category == null)
            {
                throw new CustomResourceNotFoundException("TRANSACTION__CATEGORY_NOT_FOUND");
            }
        }

        _mapper.Map(dto, entity);
        await _database.SaveChangesAsync();
        return _mapper.Map<TransactionDto>(entity);
    }

    public async Task Delete(Guid userId, Guid entityId)
    {
        Transaction? entity = await _database.Transactions
            .FirstOrDefaultAsync(e => e.UserId == userId && e.Id == entityId);
        if (entity == null)
        {
            throw new CustomResourceNotFoundException("TRANSACTION__NOT_FOUND");
        }
        _database.Transactions.Remove(entity);
        await _database.SaveChangesAsync();
    }

}