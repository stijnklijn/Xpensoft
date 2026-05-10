using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Xpensoft.Api.Dtos;
using Xpensoft.Api.Extensions;
using Xpensoft.Api.Services;

namespace Xpensoft.Api.Controllers;

[ApiController]
[Route("users")]
[Consumes("application/json")]
[Produces("application/json")]
public class UserController(UserService service) : ControllerBase
{
    private readonly UserService _service = service;

    [HttpPost]
    [Route("exists")]
    public async Task<ActionResult<UserExistsResponseDto>> Exists(UserExistsRequestDto requestDto)
    {
        UserExistsResponseDto responseDto = await _service.Exists(requestDto);
        return Ok(responseDto);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> Create(UserCreateRequestDto dto)
    {
        await _service.Create(dto);
        return Created();
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserResponseDto>> ReadById()
    {
        UserResponseDto dto = await _service.ReadById(User.GetUserId());
        return Ok(dto);
    }

    [Authorize]
    [HttpPut]
    public async Task<ActionResult<UserResponseDto>> Update(UserUpdateRequestDto dto)
    {
        await _service.Update(User.GetUserId(), dto);
        return Ok();
    }

}