from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    RunContext,
    WorkerOptions,
    cli,
    function_tool,
)
from livekit.plugins import google, silero

load_dotenv()


@function_tool
async def get_weather(context: RunContext, location: str) -> str:
    """Get the current weather for a location.

    Args:
        location: The city or location to get weather for
    """
    # Replace with actual weather API call (e.g., OpenWeatherMap)
    return f"The weather in {location} is sunny and 72°F"


@function_tool
async def get_time(context: RunContext) -> str:
    """Get the current time."""
    from datetime import datetime
    return f"The current time is {datetime.now().strftime('%I:%M %p')}"


@function_tool
async def set_reminder(context: RunContext, reminder: str, minutes: int) -> str:
    """Set a reminder for the user.

    Args:
        reminder: What to remind the user about
        minutes: How many minutes from now to remind
    """
    # In a real implementation, you would store this and trigger later
    return f"I've set a reminder for '{reminder}' in {minutes} minutes."


async def entrypoint(ctx: JobContext):
    await ctx.connect()

    agent = Agent(
        instructions="""أنا شمس، مساعدك الصوتي المشرق! زي الشمس اللي بتنور يومك، أنا هنا عشان أساعدك وأفرحك.
        شخصيتي دافية ومبهجة، وبحب أنشر الطاقة الإيجابية في كل محادثة.

        بتكلم باللهجة المصرية العامية وبحب أساعد في:
        - معرفة حالة الطقس في أي مكان
        - معرفة الوقت الحالي
        - ضبط تذكيرات

        اتكلم بطريقة مشرقة وحماسية زي أشعة الشمس الدافية.
        استخدم تعبيرات مصرية شائعة زي "أهلاً وسهلاً"، "تمام"، "حاضر"، "إن شاء الله".
        خلي ردودي قصيرة ومختصرة لأن دي محادثة صوتية.
        لما حد يسألني عن اسمي، بقوله إني شمس.
        لما حد يسأل عن الطقس أو الوقت أو التذكيرات، استخدم الأدوات المناسبة.""",
        tools=[get_weather, get_time, set_reminder],
    )

    session = AgentSession(
        vad=silero.VAD.load(),
        llm=google.realtime.RealtimeModel(
            model="gemini-2.0-flash-exp",
            voice="Puck",  # Options: Puck, Charon, Kore, Fenrir, Aoede
            temperature=0.8,
        ),
    )

    await session.start(agent=agent, room=ctx.room)
    await session.generate_reply(
        instructions="سلم على المستخدم بطريقة مشرقة ومبهجة وعرّف نفسك إنك شمس. قوله باختصار إنك هنا عشان تنور يومه وتساعده."
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
