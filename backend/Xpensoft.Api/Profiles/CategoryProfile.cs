using AutoMapper;

using Xpensoft.Api.Dtos;
using Xpensoft.Api.Models;

namespace Xpensoft.Api.Profiles;

public class CategoryProfile : Profile
{
    public CategoryProfile()
    {
        CreateMap<Category, CategoryDto>();

        CreateMap<CategoryDto, Category>().ForMember(dest => dest.Id, opt => opt.Ignore());
    }

}