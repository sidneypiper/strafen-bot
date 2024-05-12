import discord
import os
import aiosqlite
import asyncio

database_path = os.getenv("DATABASE")

bot = discord.Bot()

usernames = []
penalties = []

async def cache_usernames():
    global usernames, database_path
    usernames = []

    async with aiosqlite.connect(database_path) as db:
        async with db.execute("SELECT name FROM users") as cursor:
            async for row in cursor:
                usernames.append(row[0])


async def cache_penalty_names():
    global penalties, database_path
    penalties = []

    async with aiosqlite.connect(database_path) as db:
        async with db.execute("SELECT penalty FROM penaltys") as cursor:
            async for row in cursor:
                penalties.append(row[0])


asyncio.run(cache_usernames())
asyncio.run(cache_penalty_names())


async def get_user_id(user):
    global database_path
    async with aiosqlite.connect(database_path) as db:
        async with db.execute(
            f"SELECT user_id FROM users WHERE LOWER(name) = '{user.lower()}'"
        ) as cursor:
            row = await cursor.fetchone()
            return int(row[0])


async def get_penalty_id(penalty):
    global database_path
    async with aiosqlite.connect(database_path) as db:
        async with db.execute(
            f"SELECT penalty_id FROM penaltys WHERE LOWER(penalty) = '{penalty.lower()}'"
        ) as cursor:
            row = await cursor.fetchone()
            return int(row[0])


@bot.event
async def on_ready():
    global database_path
    print(f"{bot.user} is ready and online!")

    async with aiosqlite.connect(database_path) as db:
        await db.execute("PRAGMA foreign_keys=ON")
        await db.commit()


@bot.slash_command(name="add", description="Adds a penalty to a user")
async def add(ctx, user: discord.Option(str, choices=usernames), penalty: discord.Option(str, choices=penalties)):  # type: ignore
    global database_path

    user_id = await get_user_id(user)
    penalty_id = await get_penalty_id(penalty)

    async with aiosqlite.connect(database_path) as db:
        await db.execute(
            f"INSERT INTO user_penalty (user_id, penalty_id) VALUES ({user_id}, {penalty_id})"
        )
        await db.commit()

    await ctx.respond(f"Successfully added {penalty} to {user}!")


@bot.slash_command(name="remove", description="Removes a penalty from a user")
async def remove(ctx, user: discord.Option(str, choices=usernames), penalty: discord.Option(str, choices=penalties)):  # type: ignore
    global database_path

    user_id = await get_user_id(user)
    penalty_id = await get_penalty_id(penalty)

    async with aiosqlite.connect(database_path) as db:
        await db.execute(
            f"DELETE FROM user_penalty WHERE user_penalty_id = (SELECT user_penalty_id FROM user_penalty WHERE user_id = {user_id} AND penalty_id = {penalty_id} ORDER BY timestamp DESC LIMIT 1)"
        )
        await db.commit()

    await ctx.respond(f"Successfully removed {penalty} from {user}!")


@bot.slash_command(name="stats", description="Shows the stats of a user")
async def stats(ctx, user: discord.Option(str, choices=usernames)):  # type: ignore
    global database_path

    user_id = await get_user_id(user)
    data = []
    result = 0
    response = ""

    async with aiosqlite.connect(database_path) as db:
        async with db.execute(
            f"SELECT penalty, value, COUNT(*) FROM users NATURAL JOIN user_penalty NATURAL JOIN penaltys WHERE user_id = {user_id} GROUP BY penalty, value"
        ) as cursor:
            data = await cursor.fetchall()

    for name, value, count in data:
        result += value * count
        response += f"{count}x {name}\n"

    embed = discord.Embed(title=user, description=f"{result:0.2f}€")
    embed.add_field(name="", value=response)

    await ctx.respond(embed=embed)


@bot.slash_command(
    name="cash", description="Shows the current sum of penaltys for each user"
)
async def cash(ctx):
    global database_path

    data = []
    response = ""

    async with aiosqlite.connect(database_path) as db:
        async with db.execute(
            f"SELECT name, SUM(value) FROM users NATURAL JOIN user_penalty NATURAL JOIN penaltys GROUP BY name"
        ) as cursor:
            data = await cursor.fetchall()

    for name, value in data:
        response += f"{name}: {value:.2f}€\n"

    embed = discord.Embed(title="Strafen")
    embed.add_field(name="", value=response)

    await ctx.respond(embed=embed)

bot.run(os.getenv("TOKEN"))
