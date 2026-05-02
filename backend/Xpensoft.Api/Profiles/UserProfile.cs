using AutoMapper;

using Xpensoft.Api.Dtos;
using Xpensoft.Api.Models;

namespace Xpensoft.Api.Profiles;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserResponseDto>();
        CreateMap<UserCreateRequestDto, User>().ForMember(dest => dest.Id, opt => opt.Ignore());
        CreateMap<UserUpdateRequestDto, User>().ForMember(dest => dest.Id, opt => opt.Ignore());
    }

}