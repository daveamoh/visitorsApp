import React, { useState } from 'react';
import { visitorApi } from '../../src/services/api';
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Constants
const DEPARTMENTS = [
  { label: 'IT', value: 'it' },
  { label: 'HR', value: 'hr' },
  { label: 'Finance', value: 'finance' },
  { label: 'Operations', value: 'operations' },
  { label: 'Management', value: 'management' },
] as const;

type Department = string;

interface FormData {
  fullName: string;
  phoneNumber: string;
  purposeOfVisit: string;
  company: string;
  staffName: string;
  staffPhoneNumber: string;
  staffDepartment: string;
}

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  staffName?: string;
  staffPhoneNumber?: string;
  staffDepartment?: string;
}

const VisitorRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    purposeOfVisit: '',
    company: '',
    staffName: '',
    staffPhoneNumber: '',
    staffDepartment: '',
  });

  const [selectedValue, setSelectedValue] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,}$/i.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.staffName.trim()) {
      newErrors.staffName = 'Staff name is required';
    }

    if (!formData.staffPhoneNumber.trim()) {
      newErrors.staffPhoneNumber = 'Staff phone number is required';
    } else if (!/^\+?[0-9\s-]{10,}$/i.test(formData.staffPhoneNumber)) {
      newErrors.staffPhoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.staffDepartment) {
      newErrors.staffDepartment = 'Please select a department';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the data for the API
      const visitData = {
        visitor_name: formData.fullName.trim(),
        visitor_msisdn: formData.phoneNumber.trim(),
        visitor_company: formData.company.trim(),
        staff_name: formData.staffName.trim(),
        staff_msisdn: formData.staffPhoneNumber.trim(),
        staff_department: formData.staffDepartment,
        visitor_reason: formData.purposeOfVisit.trim(),
        check_in_time: new Date().toISOString(),
        
      };

      // Call the API
      const response = await visitorApi.checkInVisitor(visitData);
      
      // Reset form on successful submission
      setFormData({
        fullName: '',
        phoneNumber: '',
        purposeOfVisit: '',
        company: '',
        staffName: '',
        staffPhoneNumber: '',
        staffDepartment: '',
      });
      setSelectedValue('');
      
      // Show success message with visit details
      alert(`Visitor checked in successfully!\nReference: ${response.data.referenceNumber}`);
    } catch (error: any) {
      console.error('Submission error:', error);
      let errorMessage = 'Failed to submit form. Please try again.';
      
      // Check if it's an Axios error and has a response with error message
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>Visitor Registration</Text>
          <Text style={styles.subtitle}>Please complete the form below</Text>

          {/* Full Name */}
          <Text style={styles.label}>
            Full Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput 
            style={[
              styles.input, 
              errors.fullName && styles.errorInput
            ]} 
            value={formData.fullName} 
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Enter your full name"
            accessibilityLabel="Full Name"
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          {/* Phone Number */}
          <Text style={styles.label}>
            Phone Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput 
            style={[
              styles.input, 
              errors.phoneNumber && styles.errorInput
            ]} 
            value={formData.phoneNumber} 
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
            accessibilityLabel="Phone Number"
          />
          {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

          {/* Purpose of Visit */}
          <Text style={styles.label}>Purpose of Visit</Text>
          <TextInput 
            style={styles.input} 
            value={formData.purposeOfVisit} 
            onChangeText={(value) => handleInputChange('purposeOfVisit', value)}
            placeholder="Purpose of your visit"
            accessibilityLabel="Purpose of Visit"
          />

          {/* Company */}
          <Text style={styles.label}>Company</Text>
          <TextInput 
            style={styles.input} 
            value={formData.company} 
            onChangeText={(value) => handleInputChange('company', value)}
            placeholder="Your company name"
            accessibilityLabel="Company"
          />  

          {/* Visitee/Staff Name */}
          <Text style={styles.label}>
            Visitee/Staff Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput 
            style={[
              styles.input, 
              errors.staffName && styles.errorInput
            ]} 
            value={formData.staffName} 
            onChangeText={(value) => handleInputChange('staffName', value)}
            placeholder="Name of the person you're visiting"
            accessibilityLabel="Visitee or Staff Name"
          />
          {errors.staffName && <Text style={styles.errorText}>{errors.staffName}</Text>}

          {/* Visitee/Staff Phone Number */}
          <Text style={styles.label}>
            Visitee/Staff Phone Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput 
            style={[
              styles.input, 
              errors.staffPhoneNumber && styles.errorInput
            ]} 
            value={formData.staffPhoneNumber} 
            onChangeText={(value) => handleInputChange('staffPhoneNumber', value)} 
            keyboardType="phone-pad"
            placeholder="Visitee's phone number"
            accessibilityLabel="Visitee or Staff Phone Number"
          />
          {errors.staffPhoneNumber && <Text style={styles.errorText}>{errors.staffPhoneNumber}</Text>}

          {/* Department Picker */}
          <Text style={styles.label}>
            Department <Text style={styles.required}>*</Text>
          </Text>
          <View style={[
            styles.pickerContainer,
            errors.staffDepartment ? styles.errorInput : null
          ]}>
            <Picker
              selectedValue={selectedValue}
              onValueChange={(itemValue: string | null) => {
                if (itemValue !== null) {
                  setSelectedValue(itemValue);
                  handleInputChange('staffDepartment', itemValue);
                }
              }}
              style={styles.picker}
              dropdownIconColor="#666"
              mode="dropdown"
            >
              <Picker.Item label="Select a department..." value="" />
              {DEPARTMENTS.map((dept) => (
                <Picker.Item 
                  key={dept.value} 
                  label={dept.label} 
                  value={dept.value} 
                />
              ))}
            </Picker>
          </View>
          {errors.staffDepartment && <Text style={styles.errorText}>{errors.staffDepartment}</Text>}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.button,
              isSubmitting && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityLabel="Submit form"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  form: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  required: {
    color: '#dc3545',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  errorInput: {
    borderColor: '#dc3545',
    backgroundColor: '#fff8f8',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 4,
  },
});

export default VisitorRegistrationForm;
