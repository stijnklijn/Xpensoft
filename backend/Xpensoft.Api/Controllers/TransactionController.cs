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
[Route("transactions")]
[Produces("application/json")]
public class TransactionController(TransactionService service) : ControllerBase
{
    private readonly TransactionService _service = service;

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create(TransactionDto dto)
    {
        dto = await _service.Create(User.GetUserId(), dto);
        return CreatedAtAction(nameof(ReadById), new { entityId = dto.Id }, dto);
    }

    [HttpGet]
    public async Task<ActionResult<PageResult<TransactionDto>>> ReadAll([FromQuery] SieveModel sieveModel)
    {
        PageResult<TransactionDto> dtos = await _service.ReadAll(User.GetUserId(), sieveModel);
        return Ok(dtos);
    }

    [HttpGet("{entityId}")]
    public async Task<ActionResult<TransactionDto>> ReadById(Guid entityId)
    {
        TransactionDto dto = await _service.ReadById(User.GetUserId(), entityId);
        return Ok(dto);
    }

    [HttpPut("{entityId}")]
    public async Task<ActionResult<TransactionDto>> Update(Guid entityId, TransactionDto dto)
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