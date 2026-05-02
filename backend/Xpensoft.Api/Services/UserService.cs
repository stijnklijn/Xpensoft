using AutoMapper;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using Xpensoft.Api.Data;
using Xpensoft.Api.Dtos;
using Xpensoft.Api.Exceptions;
using Xpensoft.Api.Models;

namespace Xpensoft.Api.Services;

public class UserService(XpensoftDbContext database, IMapper mapper, IPasswordHasher<User> passwordHasher)
{

    private readonly XpensoftDbContext _database = database;
    private readonly IMapper _mapper = mapper;
    private readonly IPasswordHasher<User> _passwordHasher = passwordHasher;

    public async Task<UserExistsResponseDto> Exists(UserExistsRequestDto dto)
    {
        User? existingUser = await _database.Users.AsNoTracking().FirstOrDefaultAsync(e => e.Email == dto.Email);
        if (existingUser != null)
        {
            return new UserExistsResponseDto() { Exists = true };
        }
        return new UserExistsResponseDto() { Exists = false };
    }

    public async Task<UserResponseDto> Create(UserCreateRequestDto dto)
    {
        User? existingUser = await _database.Users.AsNoTracking().FirstOrDefaultAsync(e => e.Email == dto.Email);
        if (existingUser != null)
        {
            throw new CustomDuplicateResourceException("USER__EMAIL_ALREADY_EXISTS");
        }
        User entity = _mapper.Map<User>(dto);
        entity.Password = _passwordHasher.HashPassword(entity, dto.Password);
        await _database.AddAsync(entity);
        await _database.SaveChangesAsync();
        return _mapper.Map<UserResponseDto>(entity);
    }

    public async Task<UserResponseDto> ReadById(Guid userId)
    {
        User? entity = await _database.Users.AsNoTracking().FirstOrDefaultAsync(e => e.Id == userId);
        if (entity == null)
        {
            throw new CustomResourceNotFoundException("USER__NOT_FOUND");
        }
        return _mapper.Map<UserResponseDto>(entity);
    }

    public async Task<UserResponseDto> Update(Guid userId, UserUpdateRequestDto dto)
    {
        User? entity = await _database.Users
            .FirstOrDefaultAsync(e => e.Id == userId);
        _mapper.Map(dto, entity);
        await _database.SaveChangesAsync();
        return _mapper.Map<UserResponseDto>(entity);
    }

}