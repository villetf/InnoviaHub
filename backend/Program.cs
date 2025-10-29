using backend.Hubs;
using backend.Models;
using backend.Models.Interfaces;
using backend.Models.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

DotNetEnv.Env.Load();

// Joel's ändringar för rätt userinfo - Azure AD Authentication för att få riktiga användar-ID och namn
// Add Azure AD Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));
// Add Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin"));
    options.AddPolicy("UserOrAdmin", policy => 
        policy.RequireRole("User", "Admin"));
    options.AddPolicy("AuthenticatedUser", policy => 
        policy.RequireAuthenticatedUser());
});
// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();


// För att använda inMemory-databas, sätt useInMemory till true
var useInMemory = true;

if (useInMemory)
{
   builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("innoviahub"));
}
else
{
   var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
   builder.Services.AddDbContext<AppDbContext>(options =>
      options.UseMySql(
         connectionString,
         ServerVersion.AutoDetect(connectionString))
      );
}

// Joel's ändringar för rätt userinfo - CORS för att tillåta frontend att anropa API
builder.Services.AddCors(opt => {
   opt.AddPolicy("ng", p => p
      .WithOrigins("http://localhost:4200", "https://innoviahub-app-6hrgl.ondigitalocean.app")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials()
   );
});

builder.Services.AddSignalR();

builder.Services.AddHttpClient("openai", client =>
{
   client.BaseAddress = new Uri("https://api.openai.com/v1/");
   var apiKey = Environment.GetEnvironmentVariable("OPENAI_KEY");
   Console.WriteLine("nyckel: ", apiKey);

   client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
   client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
});

// Joel's ändringar för rätt userinfo - Dependency Injection för repositories
//DI för repositories
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IResourceRepository, ResourceRepository>();

var app = builder.Build();


// Joel's ändringar för rätt userinfo - CORS måste aktiveras före andra middleware
app.UseCors("ng");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
   app.MapOpenApi();
}

// Joel's ändringar för rätt userinfo - Authentication och Authorization middleware för Azure AD
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// Joel's ändringar för rätt userinfo - SignalR hub för realtidsuppdateringar av bokningar
app.MapHub<BookingHub>("/hubs/bookings");

app.Run();


