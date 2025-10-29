using System;
using System.Threading.Tasks;
using backend.Hubs;
using backend.Models;
using backend.Models.Repositories;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace InnoviaHubTests;

public class BookingRepositoryTests
{
   private DbContextOptions<AppDbContext> _options;

   public BookingRepositoryTests()
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

   private IHubContext<BookingHub> CreateMockHub()
   {
      var mockClients = new Mock<IHubClients>();
      var mockClientProxy = new Mock<IClientProxy>();
      mockClients.Setup(clients => clients.All).Returns(mockClientProxy.Object);

      var mockHubContext = new Mock<IHubContext<BookingHub>>();
      mockHubContext.Setup(h => h.Clients).Returns(mockClients.Object);
      return mockHubContext.Object;
   }

   [Fact]
   public async Task AddBookingTest()
   {
      var context = CreateCleanContext();
      var hub = CreateMockHub();
      var bookingRepository = new BookingRepository(context, hub);

      var newBooking = new Booking
      {
         UserId = new Guid(),
         ResourceId = 1,
         StartTime = new DateTime(2025 - 10 - 02),
         EndTime = new DateTime(2025 - 10 - 03),
         Status = "Confirmed"
      };

      await bookingRepository.Add(newBooking);

      Assert.Contains(newBooking, context.Bookings);
   }

   [Fact]
   public async Task DeleteBookingTest()
   {
      var context = CreateCleanContext();
      var hub = CreateMockHub();
      var bookingRepository = new BookingRepository(context, hub);

      var newBooking = new Booking
      {
         UserId = new Guid(),
         ResourceId = 1,
         StartTime = new DateTime(2025 - 10 - 02),
         EndTime = new DateTime(2025 - 10 - 03),
         Status = "Confirmed"
      };

      context.Bookings.Add(newBooking);
      context.SaveChanges();

      await bookingRepository.Delete(1);

      Assert.Empty(context.Bookings);
   }
}
