using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Sieve.Models;

using Xpensoft.Api.Dtos;
using Xpensoft.Api.Extensions;
using Xpensoft.Api.Services;
using Xpensoft.Api.Services.Pagination;

namespace Xpensoft.Api.Controllers;

[Authorize]
[ApiController]
[Route("categories")]
[Consumes("application/json")]
[Produces("application/json")]
public class CategoryController(CategoryService service) : ControllerBase
{
    private readonly CategoryService _service = service;

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(CategoryDto dto)
    {
        dto = await _service.Create(User.GetUserId(), dto);
        return CreatedAtAction(nameof(ReadById), new { entityId = dto.Id }, dto);
    }

    [HttpGet]
    public async Task<ActionResult<PageResult<CategoryDto>>> ReadAll([FromQuery] SieveModel sieveModel)
    {
        PageResult<CategoryDto> dtos = await _service.ReadAll(User.GetUserId(), sieveModel);
        return Ok(dtos);
    }

    [HttpGet("{entityId}")]
    public async Task<ActionResult<CategoryDto>> ReadById(Guid entityId)
    {
        CategoryDto dto = await _service.ReadById(User.GetUserId(), entityId);
        return Ok(dto);
    }

    [HttpPut("{entityId}")]
    public async Task<ActionResult<CategoryDto>> Update(Guid entityId, CategoryDto dto)
    {
        dto = await _service.Update(User.GetUserId(), entityId, dto);
        return Ok(dto);
    }

    [HttpDelete("{entityId}")]
    public async Task<ActionResult> Delete(Guid entityId)
    {
        await _service.Delete(User.GetUserId(), entityId);
        return NoContent();
    }

}