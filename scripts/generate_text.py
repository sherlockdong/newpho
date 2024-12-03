import sys
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

# Load GPT-2
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Get the prompt
prompt = sys.argv[1].strip()
if len(prompt) < 5:
    prompt = "Once upon a time"

# Tokenize input and create attention_mask
input_ids = tokenizer.encode(prompt, return_tensors="pt").to(device)
attention_mask = torch.ones_like(input_ids).to(device)

output = model.generate(
    input_ids=input_ids,
    attention_mask=attention_mask,
    max_length=80,          # Limit the output length
    temperature=0.7,        # Reduce randomness for more focused text
    top_k=50,               # Limit sampling to top 50 tokens
    top_p=0.9,              # Include tokens up to 90% cumulative probability
    do_sample=True,         # Enable sampling
    pad_token_id=tokenizer.eos_token_id,
    no_repeat_ngram_size=3  # Avoid repetitive phrases
)


# Decode and print the generated text
generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
print(generated_text)
