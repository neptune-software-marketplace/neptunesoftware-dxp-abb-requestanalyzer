let binding = this.getBinding("rows");
if (!binding) return;

barDataRequests.setCount(binding.getLength());
