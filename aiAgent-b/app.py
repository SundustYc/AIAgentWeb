from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_openai import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from langchain.chains import LLMChain
from config import your_api_key, zhipuai_api_base
from langchain.memory import (
    ConversationBufferMemory,
    ConversationBufferWindowMemory,
    ConversationSummaryMemory,
)

# Initialize the ZhipuAI client
zhipuai_client = ChatOpenAI(
    temperature=0.95,
    model="glm-4",
    openai_api_key=your_api_key,
    openai_api_base=zhipuai_api_base
)

# Create memory instances
buffer_memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
buffer_window_memory = ConversationBufferWindowMemory(memory_key="chat_history", return_messages=True, k=5)
summary_memory = ConversationSummaryMemory(llm=zhipuai_client, memory_key="chat_history", return_messages=True)

# Default memory
memory = buffer_memory

# Dictionary to store LLMChain instances keyed by prompts
llm_chains = {}


def create_prompt(system_template):
    if system_template == "":
        return None
    escaped_template = system_template.replace("{", "{{").replace("}", "}}")
    return ChatPromptTemplate(
        messages=[
            SystemMessagePromptTemplate.from_template(escaped_template),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{question}")
        ]
    )


# Default system template
default_system_template = "你是一个AI Agent，用来解答用户的问题，请保持回答的相关性和连贯性，如果用户的请求不明确，可以寻求澄清，始终保持礼貌和专业"

default_zhipuai_prompt = create_prompt(default_system_template)
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)


@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        prompt = data['prompt']
        question = data['message']
        global llm_chains
        # Check if an LLMChain exists for the given prompt
        if prompt in llm_chains:
            zhipuai_conversation = llm_chains[prompt]
        else:
            zhipuai_prompt = create_prompt(prompt) or default_zhipuai_prompt
            zhipuai_conversation = LLMChain(
                llm=zhipuai_client,
                prompt=zhipuai_prompt,
                verbose=True,
                memory=memory
            )
            llm_chains[prompt] = zhipuai_conversation  # Store the LLMChain for future use

        response = zhipuai_conversation.invoke({"question": question})

        if "text" in response:
            return jsonify({"response": response["text"]})
        else:
            return jsonify({"response": "Error: No text response from model"})
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/reset', methods=['POST'])
def reset():
    global llm_chains, memory
    memory.clear()
    llm_chains.clear()
    return jsonify({"response": "对话已重置，请选择模型进行对话"})


if __name__ == '__main__':
    app.run(debug=True)
