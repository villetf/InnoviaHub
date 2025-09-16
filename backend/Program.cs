using backend.Hubs;
using backend.Models;
using backend.Models.Interfaces;
using backend.Models.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// För att använda inMemory-databas, sätt useInMemory till true
var useInMemory = false;

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


builder.Services.AddCors(opt => {
   opt.AddPolicy("ng", p => p
      .WithOrigins("http://localhost:4200", "https://innoviahub-app-6hrgl.ondigitalocean.app")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials()
   );
});

builder.Services.AddSignalR();

//DI för repositories
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IResourceRepository, ResourceRepository>();

var app = builder.Build();

app.UseCors("ng");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
   app.MapOpenApi();
}
else
{
   app.UseHttpsRedirection();
}


app.UseAuthorization();

app.MapControllers();
app.MapHub<BookingHub>("/hubs/bookings");

app.Run();
