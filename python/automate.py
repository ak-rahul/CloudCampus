from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import os

driver = webdriver.Chrome()
driver.get("https://moondream.ai/playground")
time.sleep(3)

file_input = driver.find_element(By.XPATH, '//input[@type="file"]')

image_path = os.path.abspath("new1.jpeg")  
file_input.send_keys(image_path)

time.sleep(5)

prompt_input = driver.find_element(By.XPATH, '//textarea')

prompt_text = "Extract all handwritten text from this image"
prompt_input.send_keys(prompt_text)

prompt_input.send_keys(Keys.RETURN)

time.sleep(40)

try:
    result_text = driver.find_element(By.XPATH, '//div[contains(@class, "framer-na6u2s-container")]').text
    print("Extracted Handwritten Text:", result_text)
except:
    print("Could not retrieve the extracted text. Please check the XPath.")

driver.quit()
