using backend.Models;
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

app.Run();
