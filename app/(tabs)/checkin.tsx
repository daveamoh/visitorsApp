import React, { useState, useEffect } from 'react';
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
// import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';
import { useSnackbar } from '../../src/contexts/SnackbarContext';

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
  const { showSnackbar } = useSnackbar();

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
    } else if (!/^\+?[0-9\s-]{10,}$/i.test(formData.staffPhoneNumber)) {
      newErrors.staffPhoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.staffDepartment) {
      newErrors.staffDepartment = 'Please select a department';
    }
    
    if (Object.keys(newErrors).length > 0) {
      showSnackbar('Please fill in all required fields', 'error');
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
      showSnackbar(`Visitor checked in successfully! Reference: ${response.data.referenceNumber}`, 'success');
    } catch (error: any) {
      console.error('Submission error:', error);
      let errorMessage = 'Failed to submit form. Please try again.';
      
      // Check if it's an Axios error and has a response with error message
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showSnackbar(errorMessage, 'error');
      
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={{ marginBottom: 8 }}>
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

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitle}>Host Information</Text>
          </View>
          
          {/* Visitee/Staff Name */}
          <Text style={styles.label}>
            Host Name <Text style={styles.required}>*</Text>
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
            Host Phone Number <Text style={styles.required}>*</Text>
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
            Host Department <Text style={styles.required}>*</Text>
          </Text>
          <View style={[
            styles.pickerContainer,
            errors.staffDepartment ? styles.errorInput : null
          ]}>
            <RNPickerSelect
  onValueChange={(value) => handleInputChange('staffDepartment', value)}
  items={DEPARTMENTS.map(dept => ({
    label: dept.label,
    value: dept.value,
  }))}
  placeholder={{ label: "Select host department...", value: "" }}
  style={{
    inputIOS: styles.input,
    inputAndroid: styles.input,
    placeholder: { color: '#a0aec0' },
  }}
  value={formData.staffDepartment}
/>
          </View>
          {errors.staffDepartment && <Text style={styles.errorText}>{errors.staffDepartment}</Text>}

          </View>
          
          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.button,
              isSubmitting && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityLabel="Submit form"
            activeOpacity={0.9}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Check In Visitor</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {isSubmitting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Processing your request...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    justifyContent: 'center',
  },
  scrollView: {
    flexGrow: 1,
  },
  form: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#4a5568',
    fontWeight: '500',
  },
  required: {
    color: '#e53e3e',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 4,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#1a202c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  picker: {
    width: '100%',
    height: 52,
    color: '#1a202c',
  },
  errorInput: {
    borderColor: '#e53e3e',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '500',
  },
});

export default VisitorRegistrationForm;
