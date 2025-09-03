using System;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

public class AppDbContext : DbContext
{
   public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
   {
      Database.EnsureCreated();
   }
}
