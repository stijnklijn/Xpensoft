FROM mcr.microsoft.com/dotnet/sdk:10.0

WORKDIR /app

COPY . .

RUN dotnet restore

RUN dotnet tool install --global dotnet-ef --version 10.0.1

ENV PATH="/root/.dotnet/tools:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

ENTRYPOINT sh -c "\
echo 'Wait until SQL Server is ready...' && \
until dotnet ef database update --project ./Xpensoft.Api/Xpensoft.Api.csproj --startup-project ./Xpensoft.Api/Xpensoft.Api.csproj; do \
  echo 'Not ready yet, wait 2 seconds...' && sleep 2; \
done && \
echo 'Migration complete, build and start API...' && \
dotnet publish ./Xpensoft.Api/Xpensoft.Api.csproj -c Release -o out && \
exec dotnet out/Xpensoft.Api.dll"