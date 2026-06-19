FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ./Xpensoft.Api.csproj ./Xpensoft.Api/
COPY . ./Xpensoft.Api/

WORKDIR /src/Xpensoft.Api

RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Xpensoft.Api.dll"]