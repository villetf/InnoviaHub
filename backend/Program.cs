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

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("innoviahub"));

builder.Services.AddCors(opt => {
   opt.AddDefaultPolicy(policy => 
   {
      policy.AllowAnyHeader();
      policy.AllowAnyMethod();
      policy.AllowAnyOrigin();
   });
});

builder.Services.AddSignalR();

//DI för repositories
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IResourceRepository, ResourceRepository>();

var app = builder.Build();

app.UseCors();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
   app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<BookingHub>("/hubs/bookings");

app.Run();
