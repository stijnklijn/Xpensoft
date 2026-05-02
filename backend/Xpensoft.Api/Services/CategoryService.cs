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

public class CategoryService(XpensoftDbContext database, SieveProcessor sieveProcessor, IMapper mapper)
{

    private readonly XpensoftDbContext _database = database;
    private readonly SieveProcessor _sieveProcessor = sieveProcessor;
    private readonly IMapper _mapper = mapper;

    public async Task<CategoryDto> Create(Guid userId, CategoryDto dto)
    {
        Category? existingCategory = await _database.Categories.AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId && e.Name == dto.Name);
        if (existingCategory != null)
        {
            throw new CustomDuplicateResourceException("CATEGORY__NAME_ALREADY_EXISTS");
        }
        Category entity = _mapper.Map<Category>(dto);
        entity.UserId = userId;
        await _database.AddAsync(entity);
        await _database.SaveChangesAsync();
        return _mapper.Map<CategoryDto>(entity);
    }

    public async Task<PageResult<CategoryDto>> ReadAll(Guid userId, SieveModel sieveModel)
    {
        IQueryable<Category> queryable = _database.Categories.AsNoTracking()
            .Where(e => e.UserId == userId);
        return await Paginator.GetPageResult<Category, CategoryDto>(sieveModel, _sieveProcessor, queryable, _mapper);
    }

    public async Task<CategoryDto> ReadById(Guid userId, Guid entityId)
    {
        Category? entity = await _database.Categories.AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId && e.Id == entityId);
        if (entity == null)
        {
            throw new CustomResourceNotFoundException("CATEGORY__NOT_FOUND");
        }
        return _mapper.Map<CategoryDto>(entity);
    }

    public async Task<CategoryDto> Update(Guid userId, Guid entityId, CategoryDto dto)
    {
        Category? entity = await _database.Categories
            .FirstOrDefaultAsync(e => e.UserId == userId && e.Id == entityId);
        if (entity == null)
        {
            throw new CustomResourceNotFoundException("CATEGORY__NOT_FOUND");
        }

        Category? existingCategory = await _database.Categories.AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId && e.Id != entityId && e.Name == dto.Name);
        if (existingCategory != null)
        {
            throw new CustomDuplicateResourceException("CATEGORY__NAME_ALREADY_EXISTS");
        }

        _mapper.Map(dto, entity);
        await _database.SaveChangesAsync();
        return _mapper.Map<CategoryDto>(entity);
    }

    public async Task Delete(Guid userId, Guid entityId)
    {
        Category? entity = await _database.Categories.Include(e => e.Transactions)
            .FirstOrDefaultAsync(e => e.UserId == userId && e.Id == entityId);
        if (entity == null)
        {
            throw new CustomResourceNotFoundException("CATEGORY__NOT_FOUND");
        }
        if (entity.Transactions.Count > 0)
        {
            throw new CustomDeleteRestrictionException("CATEGORY__HOLDS_TRANSACTIONS");

        }
        _database.Categories.Remove(entity);
        await _database.SaveChangesAsync();
    }

}