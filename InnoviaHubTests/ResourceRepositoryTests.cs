using System;
using backend.Models;
using backend.Models.Entities;
using backend.Models.Repositories;
using Microsoft.EntityFrameworkCore;

namespace InnoviaHubTests;

public class ResourceRepositoryTests
{
   private DbContextOptions<AppDbContext> _options;

   public ResourceRepositoryTests()
   {
      _options = new DbContextOptionsBuilder<AppDbContext>()
         .UseInMemoryDatabase(databaseName: "testdb")
         .Options;
   }

   private AppDbContext CreateCleanContext()
   {
      var context = new AppDbContext(_options);
      context.Database.EnsureDeleted();
      context.Database.EnsureCreated();
      context.SaveChanges();
      return new AppDbContext(_options);
   }

   [Fact]
   public async Task GetAllResourcesTest()
   {
      var context = CreateCleanContext();
      var resourceRepository = new ResourceRepository(context);

      var existingResources = await resourceRepository.GetAll();

      Assert.False(existingResources.Count < 6);
      Assert.False(existingResources.Count > 6);
      Assert.InRange(existingResources.Count, 6, 6);
   }

   [Fact]
   public async Task GetResourceByIdTest()
   {
      var context = CreateCleanContext();
      var resourceRepository = new ResourceRepository(context);

      var newResource = new Resource
      {
         Id = 100,
         ResourceTypeId = 1,
         Name = "Skrivbord"
      };

      context.Resources.Add(newResource);
      context.SaveChanges();

      Assert.Equal(newResource, await resourceRepository.GetById(100));
   }
}
